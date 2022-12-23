import { Notice } from "obsidian";

export class InfoNotice extends Notice {
	constructor(message: string | DocumentFragment, timeout?: number) {
		super(`Inbox\n${message}`, timeout);
		console.info(`obsidian-inbox: ${message}`);
	}
}

export class ErrorNotice extends Notice {
	constructor(message: string | DocumentFragment, timeout?: number) {
		super(`Inbox\n${message}`, timeout);
		console.error(`obsidian-inbox: ${message}`);
	}
}
