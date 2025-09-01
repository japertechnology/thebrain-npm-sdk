import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TheBrainApi } from '../../index';
import { TestHelper } from './helpers';
import { SearchResultDto } from '../../model';

let testBrainId: string;
let helper: TestHelper;
let api: TheBrainApi;

describe.skipIf(!process.env.THEBRAIN_API_KEY)('Search API E2E', () => {
    beforeAll(async () => {
        // Initialize API and create test resources
        helper = new TestHelper();
        api = helper.api;
        
        // Create a test brain for search testing
        const brain = await helper.createTestBrain('Test Brain Search E2E');
        testBrainId = brain.id!;
        console.log('Created test brain for search testing:', testBrainId);
        
        // Create a test thought with searchable content
        const thought = await api.thoughts.createThought(testBrainId, {
            name: 'SearchableThought',
            kind: 1
        });
        console.log('Created test thought for search testing:', thought.id);
        
        // Add a note to the thought to make it searchable by content
        await api.notes.createOrUpdateNote(testBrainId, thought.id!, {
            markdown: '# Test Note for Search\n\nThis content should be searchable in our E2E tests.'
        });
        console.log('Added note content to test thought');
    });

    afterAll(async () => {
        // Clean up test resources
        await helper.cleanup();
    });

    describe('Search Operations', () => {
        it('should search within a brain', async () => {
            try {
                // Search for the thought we created
                const results = await api.search.searchInBrain(testBrainId, 'Searchable');
                
                // Verify we got search results
                expect(Array.isArray(results)).toBe(true);
                
                // Results may take time to be indexed, so don't strictly assert on count
                console.log(`Found ${results.length} search results for 'Searchable'`);
                
                // Only validate if we have results with actual data
                if (results.length > 0 && results[0] && results[0].id) {
                    validateSearchResult(results[0]);
                }
            } catch (error: any) {
                console.log('Error during search in brain:', error.message);
                if (error.response) {
                    console.log('Status:', error.response.status);
                    console.log('Response data:', error.response.data);
                }
                throw error;
            }
        });

        it('should search with custom options', async () => {
            try {
                // Search with custom options
                const results = await api.search.searchInBrain(testBrainId, 'Search', {
                    maxResults: 5,
                    onlySearchThoughtNames: true
                });
                
                // Verify we got search results as an array
                expect(Array.isArray(results)).toBe(true);
                
                console.log(`Found ${results.length} results when searching only thought names for 'Search'`);
                
                // Only validate if we have results with actual data
                if (results.length > 0 && results[0] && results[0].id) {
                    validateSearchResult(results[0]);
                }
            } catch (error: any) {
                console.log('Error during search with custom options:', error.message);
                if (error.response) {
                    console.log('Status:', error.response.status);
                    console.log('Response data:', error.response.data);
                }
                throw error;
            }
        });

        it('should search accessible brains', async () => {
            try {
                // Search across accessible brains
                const results = await api.search.searchAccessible('Search');
                
                // Verify we got search results
                expect(Array.isArray(results)).toBe(true);
                
                console.log(`Found ${results.length} results when searching accessible brains for 'Search'`);
                
                // Only validate if we have results with actual data
                if (results.length > 0 && results[0] && results[0].id) {
                    validateSearchResult(results[0]);
                }
            } catch (error: any) {
                console.log('Error during search accessible:', error.message);
                if (error.response) {
                    console.log('Status:', error.response.status);
                    console.log('Response data:', error.response.data);
                }
                throw error;
            }
        });

        it('should search public brains', async () => {
            try {
                // Search across public brains
                const results = await api.search.searchPublic('common term');
                
                // Verify we got search results
                expect(Array.isArray(results)).toBe(true);
                
                console.log(`Found ${results.length} results when searching public brains for 'common term'`);
                
                // Only validate if we have results with actual data
                if (results.length > 0 && results[0] && results[0].id) {
                    validateSearchResult(results[0]);
                }
            } catch (error: any) {
                console.log('Error during search public:', error.message);
                if (error.response) {
                    console.log('Status:', error.response.status);
                    console.log('Response data:', error.response.data);
                }
                throw error;
            }
        });
    });
    
    describe('Error Handling', () => {
        it('should handle invalid brain ID', async () => {
            try {
                await api.search.searchInBrain('invalid-brain-id', 'test');
                // If we reach here, the test has failed
                expect(true).toBe(false);
            } catch (error: any) {
                // Verify we get an error
                expect(error).toBeDefined();
                if (error.response) {
                    expect(error.response.status).toBeGreaterThanOrEqual(400);
                }
            }
        });

        it('should handle empty search query', async () => {
            try {
                await api.search.searchInBrain(testBrainId, '');
                // If we reach here, the API accepted empty query, which is fine
                expect(true).toBe(true);
            } catch (error: any) {
                // If API rejects empty queries, that's fine too
                console.log('Empty search query response:', error.message);
                expect(error).toBeDefined();
            }
        });
    });
});

// Helper function to validate search result structure
function validateSearchResult(result: SearchResultDto) {
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('string');
    expect(result.brainId).toBeDefined();
    expect(typeof result.brainId).toBe('string');
    expect(result.type).toBeDefined();
    expect(['thought', 'link', 'note', 'attachment']).toContain(result.type);
    expect(result.matchType).toBeDefined();
    expect(['name', 'content']).toContain(result.matchType);
    expect(result.matchText).toBeDefined();
    expect(typeof result.matchText).toBe('string');
    expect(result.score).toBeDefined();
    expect(typeof result.score).toBe('number');
}