import type { INodeType } from 'n8n-workflow';
import { Hudu } from './src/nodes/Hudu/Hudu.node';

// Export the instantiated class
const huduNode = new Hudu();
export { huduNode as Hudu };

export const nodes: INodeType[] = [huduNode];

export const credentials = [
	{
		name: 'huduApi',
		displayName: 'Hudu API',
	},
];
