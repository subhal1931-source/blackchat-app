import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Paperclip, Mic, Send, X, Loader2 } from 'lucide-react';
import { UploadFile } from '@/integrations/Core';
import { useToast } from '@/components/ui/use-toast';

interface MessageInputProps {
  onSendMessage: (content: string, attachmentUrl?: string, attachmentType?: 'image' | 'video' | 'audio') => void;
  senderName: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, senderName }) => {
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const clearAttachment = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setAttachment(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if (isUploading) return;

    let attachmentUrl: string | undefined;
    let attachmentType: 'image' | 'video' | 'audio' | undefined;

    if (attachment) {
      setIsUploading(true);
      try {
        const response = await UploadFile({ file: attachment });
        attachmentUrl = response.file_url;
        if (attachment.type.startsWith('image/')) attachmentType = 'image';
        else if (attachment.type.startsWith('video/')) attachmentType = 'video';
        else if (attachment.type.startsWith('audio/')) attachmentType = 'audio';
      } catch (error) {
        console.error('Error uploading file:', error);
        toast({ title: 'Upload Failed', description: 'Could not upload the attachment.', variant: 'destructive' });
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    onSendMessage(content, attachmentUrl, attachmentType);
    setContent('');
    clearAttachment();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      clearAttachment(); // Clear previous attachment first
      setAttachment(file);

      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleRecord = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        
        mediaRecorderRef.current.onstart = () => {
            setIsRecording(true);
            audioChunksRef.current = [];
            toast({ title: 'Recording Started', description: 'Click the mic again to stop.' });
        };

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          setIsRecording(false);
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioFile = new File([audioBlob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' });
          clearAttachment();
          setAttachment(audioFile);
          stream.getTracks().forEach(track => track.stop());
          toast({ title: 'Recording Stopped', description: 'Voice note is ready to send.' });
        };
        
        mediaRecorderRef.current.start();
      } catch (error) {
        console.error('Error accessing microphone:', error);
        toast({ title: 'Microphone Error', description: 'Could not access the microphone. Please check permissions.', variant: 'destructive' });
      }
    }
  };

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="flex flex-col gap-2">
      {attachment && (
        <div className="relative p-2 rounded-md bg-secondary self-start">
          {previewUrl && attachment.type.startsWith('image/') && (
            <img src={previewUrl} alt="Preview" className="max-h-40 rounded-md" />
          )}
          {previewUrl && attachment.type.startsWith('video/') && (
            <video src={previewUrl} controls className="max-h-40 rounded-md" />
          )}
          {attachment.type.startsWith('audio/') && (
             <div className="flex items-center gap-2 p-2">
                <Mic className="w-5 h-5 text-primary" />
                <p className="text-sm truncate">{attachment.name}</p>
             </div>
          )}
          <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={clearAttachment}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
       <div className="flex items-center gap-2">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*,audio/*" />
        <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isUploading || isRecording}>
          <Paperclip className="w-6 h-6" />
        </Button>
        <Button variant={isRecording ? "destructive" : "ghost"} size="icon" onClick={handleRecord} disabled={isUploading}>
          <Mic className={`w-6 h-6 transition-colors ${isRecording ? 'text-white' : ''}`} />
        </Button>
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isRecording ? "Recording..." : "Type a message..."}
          className="flex-1 h-12"
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          disabled={isUploading || isRecording}
        />
        <Button size="icon" onClick={handleSend} disabled={isUploading || (!content.trim() && !attachment)} className="h-12 w-12">
          {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;