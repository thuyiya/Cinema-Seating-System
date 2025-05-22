import { v4 as uuidv4 } from 'uuid';

export const generateTransactionId = (): string => {
  const timestamp = Date.now().toString();
  const uuid = uuidv4().replace(/-/g, '').substring(0, 8);
  return `TXN${timestamp}${uuid}`;
}; 