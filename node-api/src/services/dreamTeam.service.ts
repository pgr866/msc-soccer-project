import { z } from 'zod';
import { PromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatGroq } from '@langchain/groq';
import DreamTeam from '../models/dreamTeams.js';

export class DreamTeamService {
    private model: ChatGroq;
    private parser: StructuredOutputParser<any>;
    private chain: RunnableSequence;

    constructor(model: ChatGroq) {
        this.model = model;
        this.parser = StructuredOutputParser.fromZodSchema(
            z.object({
                name: z.string().describe('Creative team name in Spanish'),
                playerIds: z.array(z.string()).describe('Array of player IDs')
            })
        );
        this.chain = RunnableSequence.from([
            new PromptTemplate({
                template: `You are an expert football coach. Select the best 11 players from the list.
                STRICT RULES:
                1. If there are 11 or more players available, you MUST select exactly 11.
                2. If there are fewer than 11 players available, select ALL of them.
                3. If the list is empty, return an empty array for 'playerIds'.
                4. 'name' must be a creative, engaging team name in Spanish.
                5. PROHIBITED: Do not include markdown code blocks, do not include explanations, do not include prefixes or suffixes.
                6. ONLY output the raw JSON string.
                
                {format_instructions}
                
                Players list: {players}`,
                inputVariables: ['players'],
                partialVariables: { format_instructions: this.parser.getFormatInstructions() }
            }),
            this.model,
            this.parser,
        ]);
    }

    async generateDreamTeam(players: any[], userId: string) {
        const simplifiedPlayers = players.map(p => ({ id: p._id, name: p.name }));
        const response = await this.chain.invoke({
            players: JSON.stringify(simplifiedPlayers)
        });
        const newTeam = new DreamTeam({
            userId,
            name: response.name,
            playerIds: response.playerIds,
            createdAt: new Date()
        });
        return await newTeam.save();
    }
}
