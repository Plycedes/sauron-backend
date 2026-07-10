import mongoose from 'mongoose';
import { openaiService } from '../microservices';
import { membershipRepository } from '../repositories';
import { RagQueryInput, RagQueryResult, RagSource } from '../types/rag.types';
import { ApiError } from '../utils/ApiError';

const SYSTEM_PROMPT = `You are PulseIQ, an intelligent project progress assistant. Answer questions based strictly on the provided daily update context. Always cite the specific date and team member when referencing an update. If the question asks for numeric totals or aggregations, note that these figures come from logged structured fields, not estimates. If the context does not contain enough information to answer, say so clearly.`;

export async function query(
  input: RagQueryInput,
  requestingUserId: string,
): Promise<RagQueryResult> {
  const membership = await membershipRepository.findByUserAndCompany(
    requestingUserId,
    input.companyId,
  );
  if (!membership) {
    throw new ApiError(403, 'You can only query updates within your own company');
  }

  if (membership.role !== 'pm' && membership.role !== 'company_admin') {
    throw new ApiError(403, 'Only PMs or company admins can use the RAG query');
  }

  const questionEmbedding = await openaiService.embed(input.question);

  const vectorFilter: Record<string, mongoose.Types.ObjectId | { $gte: Date; $lte: Date }> = {
    companyId: new mongoose.Types.ObjectId(input.companyId),
  };
  if (input.projectId) {
    vectorFilter.projectId = new mongoose.Types.ObjectId(input.projectId);
  }
  if (input.userId) {
    vectorFilter.userId = new mongoose.Types.ObjectId(input.userId);
  }
  if (input.dateFrom && input.dateTo) {
    vectorFilter.date = { $gte: input.dateFrom, $lte: input.dateTo };
  }

  // NOTE: $vectorSearch requires MongoDB Atlas M10+ cluster (not free tier).
  // Create the index manually in Atlas UI: index name 'embedding_index', path 'embedding',
  // 1536 dimensions (text-embedding-3-small), cosine similarity.
  const pipeline: Record<string, unknown>[] = [
    {
      $vectorSearch: {
        index: 'embedding_index',
        path: 'embedding',
        queryVector: questionEmbedding,
        numCandidates: 100,
        limit: 12,
        filter: vectorFilter,
      },
    },
    {
      $project: {
        _id: 0,
        updateId: 1,
        userId: 1,
        projectId: 1,
        companyId: 1,
        date: 1,
        category: 1,
        confidence: 1,
        hoursSpent: 1,
        text: 1,
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ];

  const results = await mongoose.connection
    .db!.collection('embeddings')
    .aggregate(pipeline)
    .toArray();

  const chunks = results as Array<{
    updateId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    projectId: mongoose.Types.ObjectId;
    companyId: mongoose.Types.ObjectId;
    date: Date;
    category: string;
    confidence: string;
    hoursSpent: number;
    text: string;
  }>;

  const sources: RagSource[] = chunks.map((c) => ({
    updateId: c.updateId.toString(),
    userId: c.userId.toString(),
    projectId: c.projectId.toString(),
    date: c.date,
    category: c.category,
    text: c.text,
  }));

  const contextLines = chunks
    .map(
      (c) =>
        `- ${new Date(c.date).toISOString().split('T')[0]} | ${c.category} | ${c.confidence} | ${c.hoursSpent}h | ${c.text}`,
    )
    .join('\n');

  const userPrompt = `Context:\n${contextLines}\n\nQuestion: ${input.question}`;

  const answer = await openaiService.chat(SYSTEM_PROMPT, userPrompt);

  return { answer, sources };
}
