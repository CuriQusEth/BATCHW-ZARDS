export interface TrustlessAgent {
  id: string;
  contractAddress: `0x${string}`;
  status: 'active' | 'idle' | 'executing';
}
