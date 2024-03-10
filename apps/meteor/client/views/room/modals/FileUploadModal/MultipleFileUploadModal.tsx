import { Modal, Box, Field, FieldGroup, FieldLabel, FieldRow, FieldError, TextInput, Button } from '@rocket.chat/fuselage';
import { useAutoFocus } from '@rocket.chat/fuselage-hooks';
import { useToastMessageDispatch, useTranslation, useSetting } from '@rocket.chat/ui-contexts';
import fileSize from 'filesize';
import type { ReactElement, ChangeEvent, FormEventHandler, ComponentProps } from 'react';
import React, { memo, useState, useEffect } from 'react';

import FilePreview from './FilePreview';

type MultipleFileUploadModalProps = {
	onClose: () => void;
	onSubmit: ( description?: string) => void;
	files: File[];
	fileDescription?: string;
	invalidContentType: boolean;
	showDescription?: boolean;
};

const MultipleFileUploadModal = ({
	onClose,
	files,
	fileDescription,
	onSubmit,
	invalidContentType,
	showDescription = true,
}: MultipleFileUploadModalProps): ReactElement => {
	const [description, setDescription] = useState<string>(fileDescription || '');
	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();
	const maxFileSize = useSetting('FileUpload_MaxFileSize') as number;

    console.log('multiple files');

	const ref = useAutoFocus<HTMLInputElement>();

	const handleDescription = (e: ChangeEvent<HTMLInputElement>): void => {
		setDescription(e.currentTarget.value);
	};

	const handleSubmit: FormEventHandler<HTMLFormElement> = (e): void => {
		e.preventDefault();

		onSubmit(description);
	};

	useEffect(() => {

		if (files.length === 0) {
			dispatchToastMessage({
				type: 'error',
				message: t('FileUpload_File_Empty'),
			});
			onClose();
		}
	}, [files, dispatchToastMessage, invalidContentType, t, onClose]);

	return (
		<Modal wrapperFunction={(props: ComponentProps<typeof Box>) => <Box is='form' onSubmit={handleSubmit} {...props} />}>
			<Box display='flex' flexDirection='column' height='100%'>
				<Modal.Header>
					<Modal.Title>{t('FileUpload')}</Modal.Title>
					<Modal.Close onClick={onClose} />
				</Modal.Header>
				<Modal.Content>
					{
						files.map((item)=>{
							<Box display='flex' maxHeight='x360' w='full' justifyContent='center' alignContent='center' mbe={16}>
						<FilePreview file={item} />
					</Box>
						})
					}
					
					<FieldGroup>
						{showDescription && (
							<Field>
								<FieldLabel>{t('Upload_file_description')}</FieldLabel>
								<FieldRow>
									<TextInput value={description} onChange={handleDescription} placeholder={t('Description')} ref={ref} />
								</FieldRow>
							</Field>
						)}
					</FieldGroup>
				</Modal.Content>
				<Modal.Footer>
					<Modal.FooterControllers>
						<Button secondary onClick={onClose}>
							{t('Cancel')}
						</Button>
						<Button primary type='submit' disabled={!description}>
							{t('Send')}
						</Button>
					</Modal.FooterControllers>
				</Modal.Footer>
			</Box>
		</Modal>
	);
};

export default memo(MultipleFileUploadModal);
