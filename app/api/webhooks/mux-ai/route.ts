// Compatibility shim: Mux webhook configs pointing at /api/webhooks/mux-ai
// continue to work after the handler moved to /api/webhooks/mux.
export { POST } from '../mux/route';
