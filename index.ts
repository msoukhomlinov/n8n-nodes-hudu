import { INodeType } from 'n8n-workflow';
import { Hudu } from './Hudu.node';

// Export the instantiated class
const huduNode = new Hudu();
export { huduNode as Hudu };

export const nodes: INodeType[] = [
	huduNode,
];

export const credentials = [
	{
		name: 'huduApi',
		displayName: 'Hudu API',
	},
]; 