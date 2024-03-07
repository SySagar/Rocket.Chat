import { isRoomFederated } from '@rocket.chat/core-typings';

import { fileUploadIsValidContentType } from '../../../../app/utils/client';
import FileUploadModal from '../../../views/room/modals/FileUploadModal';
import { imperativeModal } from '../../imperativeModal';
import { prependReplies } from '../../utils/prependReplies';
import type { ChatAPI } from '../ChatAPI';

export const uploadMultipleFiles = async (chat: ChatAPI, files: readonly { file: File; preview: string }[], resetFileInput?: () => void): Promise<void> => {
	const replies = chat.composer?.quotedMessages.get() ?? [];

	const msg = await prependReplies('', replies);

	const room = await chat.data.getRoom();

	const queue = [...files];
    console.log('queue', queue);

	const uploadNextFile = (): void => {
		const file = queue.pop();
		if (!file) {
			chat.composer?.dismissAllQuotedMessages();
			return;
		}

		imperativeModal.open({
			component: FileUploadModal,
			props: {
				file:file.file,
				fileName: file.file.name,
				fileDescription: chat.composer?.text ?? '',
				showDescription: room && !isRoomFederated(room),
				onClose: (): void => {
					imperativeModal.close();
					uploadNextFile();
				},
				onSubmit: (fileName: string, description?: string): void => {
					Object.defineProperty(file, 'name', {
						writable: true,
						value: fileName,
					});
					chat.uploads.send(file.file, {
						description,
						msg,
					});
					chat.composer?.clear();
					imperativeModal.close();
					uploadNextFile();
				},
				invalidContentType: !(file.file.type && fileUploadIsValidContentType(file.file.type)),
			},
		});
	};

	uploadNextFile();
	resetFileInput?.();
};
