import React, { useState, useRef, useEffect } from 'react';
import { Modal, Box, Typography, Button, Stack, Snackbar, Alert, Card, CardContent, Tooltip, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Editor } from '@tinymce/tinymce-react';

// Props for ReplyModal
interface ReplyModalProps {
  open: boolean;
  onClose: () => void;
  aiSuggestion?: string;
  onSend: (reply: string) => Promise<void>;
}

const ReplyModal: React.FC<ReplyModalProps> = ({ open, onClose, aiSuggestion, onSend }) => {
  const [reply, setReply] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (open) {
      setReply('');
    }
  }, [open]);

  // Keyboard shortcut: Enter to send, Esc to close, R to focus reply
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSend();
      if (e.key.toLowerCase() === 'r') {
        if (editorRef.current) editorRef.current.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, reply]);

  const handleAccept = () => {
    setReply(aiSuggestion || '');
  };

  const handleEdit = () => {
    if (!reply && aiSuggestion) setReply(aiSuggestion);
  };

  const handleSend = async () => {
    try {
      await onSend(reply);
      setSnackbar({ open: true, message: 'Reply sent!', severity: 'success' });
      onClose();
    } catch {
      setSnackbar({ open: true, message: 'Failed to send reply.', severity: 'error' });
    }
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="reply-modal-title" aria-describedby="reply-modal-desc">
      <Box sx={{ maxWidth: 540, mx: 'auto', mt: 8, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 8, p: 4, outline: 'none' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography id="reply-modal-title" variant="h6" fontWeight={700} color="primary">
            Reply to Email
          </Typography>
          <IconButton onClick={onClose} aria-label="Close reply modal">
            <CloseIcon />
          </IconButton>
        </Stack>
        {/* AI Suggested Reply */}
        <Card sx={{ mb: 3, bgcolor: aiSuggestion ? 'background.default' : 'action.hover', borderLeft: aiSuggestion ? '4px solid #6C63FF' : 'none', boxShadow: aiSuggestion ? 6 : 2 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="subtitle1" color="secondary" fontWeight={600}>
                AI Suggested Reply
              </Typography>
              {aiSuggestion && (
                <Tooltip title="Accept and copy suggestion to editor" arrow>
                  <IconButton aria-label="Accept AI suggestion" onClick={handleAccept} tabIndex={0}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary" mt={1}>
              {aiSuggestion || 'No AI suggestion available for this email.'}
            </Typography>
          </CardContent>
        </Card>
        {/* Rich Text Editor */}
        <Box mb={2}>
          <Editor
            apiKey="no-api-key"
            onInit={(_evt, editor) => (editorRef.current = editor)}
            value={reply}
            onEditorChange={setReply}
            init={{
              height: 180,
              menubar: false,
              skin: 'oxide',
              content_css: 'dark',
              placeholder: 'Type your reply here...',
              toolbar: 'undo redo | bold italic underline | link | bullist numlist | removeformat',
            }}
            aria-label="Reply editor"
            tabIndex={0}
          />
        </Box>
        <Stack direction="row" spacing={2}>
          <Tooltip title="Send reply (Enter or Ctrl+Enter)" arrow>
            <Button variant="contained" color="primary" startIcon={<SendIcon />} onClick={handleSend} aria-label="Send reply" disabled={!reply.trim()} tabIndex={0}>
              Send
            </Button>
          </Tooltip>
          <Tooltip title="Edit reply" arrow>
            <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEdit} aria-label="Edit reply" tabIndex={0}>
              Edit
            </Button>
          </Tooltip>
          <Tooltip title="Cancel reply" arrow>
            <Button variant="text" onClick={onClose} aria-label="Cancel reply" tabIndex={0}>
              Cancel
            </Button>
          </Tooltip>
        </Stack>
        <Snackbar open={snackbar.open} autoHideDuration={2500} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </Modal>
  );
};

export default ReplyModal;
