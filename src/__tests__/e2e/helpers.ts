/** Tests for helpers. */
import { TheBrainApi } from '../../index';
import { BrainDto } from '../../model';
import { loadConfig } from './config';

export class TestHelper {
    private testBrains: BrainDto[] = [];
    private api_instance: TheBrainApi;

    constructor() {
        const config = loadConfig();
        this.api_instance = new TheBrainApi(config);
        
    }

    get api() {
        return this.api_instance;
    }


    async createTestBrain(name: string): Promise<BrainDto> {
        try {
            // First check if a brain with this name already exists
            const existingBrains = await this.api.brains.getBrains();
            const existingBrain = existingBrains.find(brain => brain.name === name);

            if (existingBrain) {
                console.log(`Found existing brain with name "${name}" (ID: ${existingBrain.id})`);
                this.testBrains.push(existingBrain);
                return existingBrain;
            }

            // If no existing brain found, create a new one
            const brains = await this.api.brains.createBrain(name);
            let brain: BrainDto | undefined;
            if (Array.isArray(brains)) {
                brain = brains.find(b => b.name === name);
            } else if (brains && typeof brains === 'object') {
                brain = brains;
            }
            if (!brain) {
                throw new Error('Created brain has no ID');
            }

            // Verify the brain was created by fetching it
            const createdBrain = await this.api.brains.getBrain(brain.id);
            if (!createdBrain) {
                throw new Error('Could not verify created brain');
            }

            this.testBrains.push(createdBrain);
            return createdBrain;
        } catch (error) {
            console.error('Error creating test brain:', error);
            throw error;
        }
    }

    async cleanup(): Promise<void> {
        // Delete all test brains in reverse order to avoid potential dependency issues
        for (const brain of this.testBrains.reverse()) {
            try {
                await this.api.brains.deleteBrain(brain.id);
                console.log(`Successfully deleted test brain ${brain.id}`);
            } catch (error) {
                console.error(`Failed to delete test brain ${brain.id}:`, error);
            }
        }
        this.testBrains = [];
    }
}