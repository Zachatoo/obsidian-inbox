import { Notice } from "obsidian";

const DEFAULT_NOTICE_TIMEOUT_SECONDS = 5;

export class InfoNotice extends Notice {
	constructor(
		message: string | DocumentFragment,
		timeout = DEFAULT_NOTICE_TIMEOUT_SECONDS
	) {
		super(`Inbox\n${message}`, timeout * 1000);
		console.info(`obsidian-inbox: ${message}`);
	}
}

export class ErrorNotice extends Notice {
	constructor(
		message: string | DocumentFragment,
		timeout = DEFAULT_NOTICE_TIMEOUT_SECONDS
	) {
		super(`Inbox\n${message}`, timeout * 1000);
		console.error(`obsidian-inbox: ${message}`);
	}
}
