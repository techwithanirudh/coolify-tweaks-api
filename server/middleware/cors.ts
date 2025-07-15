import { corsEventHandler } from 'nitro-cors';

// biome-ignore lint/suspicious/noEmptyBlockStatements: This is a placeholder for CORS handling and can be extended later.
export default corsEventHandler((_event) => {}, {
  origin: '*',
  methods: '*',
});
