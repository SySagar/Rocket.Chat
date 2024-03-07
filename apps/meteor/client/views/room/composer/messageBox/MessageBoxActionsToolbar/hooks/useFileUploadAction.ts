import { useTranslation, useSetting } from '@rocket.chat/ui-contexts';
import { useEffect } from 'react';

import type { GenericMenuItemProps } from '../../../../../../components/GenericMenu/GenericMenuItem';
import { useFileInput } from '../../../../../../hooks/useFileInput';
import { useChat } from '../../../../contexts/ChatContext';

const fileInputProps = { type: 'file', multiple: true };

export const useFileUploadAction = (disabled: boolean): GenericMenuItemProps => {
	const t = useTranslation();
	const fileUploadEnabled = useSetting('FileUpload_Enabled');
	const fileInputRef = useFileInput(fileInputProps);
	const chat = useChat();
	console.log('fileInputRef', fileInputRef);
	console.log('chat', chat);

	useEffect(() => {
		const resetFileInput = () => {
			if (!fileInputRef?.current) {
				return;
			}

			fileInputRef.current.value = '';
		};

		const handleUploadChange = async () => {
			const { mime } = await import('../../../../../../../app/utils/lib/mimeTypes');
			const filesToUpload = Array.from(fileInputRef?.current?.files ?? []).map((file) => {
				Object.defineProperty(file, 'type', {
					value: mime.lookup(file.name),
				});
				return {file,
					preview: URL.createObjectURL(file)};
			});
			if(filesToUpload.length > 1)
			chat?.flows.uploadMultipleFiles(filesToUpload, resetFileInput);
			else
			 chat?.flows.uploadFiles(filesToUpload, resetFileInput);
			console.log('filesToUpload', filesToUpload);
		};

		fileInputRef.current?.addEventListener('change', handleUploadChange);
		return () => fileInputRef?.current?.removeEventListener('change', handleUploadChange);
	}, [chat, fileInputRef]);

	const handleUpload = () => {
		fileInputRef?.current?.click();
	};

	return {
		id: 'file-upload',
		content: t('Upload_file'),
		icon: 'clip',
		onClick: handleUpload,
		disabled: !fileUploadEnabled || disabled,
	};
};
