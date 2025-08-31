import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChatMessage } from '@/entities/ChatMessage';
import { ChatRoom } from '@/entities/ChatRoom';
import Message from '@/components/Message';
import MessageInput from '@/components/MessageInput';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, Heart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { createPageUrl } from '@/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ChatRoomPage: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [roomDetails, setRoomDetails] = useState<any | null>(null);
  const [senderName, setSenderName] = useState('');
  const [senderId, setSenderId] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const roomId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("id") : null;

  useEffect(() => {
    const name = localStorage.getItem('blackchat_senderName');
    const id = localStorage.getItem('blackchat_senderId');
    if (name && id) {
      setSenderName(name);
      setSenderId(id);
      setTempUsername(name);
    } else {
      router.push(createPageUrl('home'));
    }

    if (!roomId) {
      toast({ title: "Error", description: "No chat room specified.", variant: "destructive" });
      router.push(createPageUrl('home'));
    }
  }, [router, roomId, toast]);

  useEffect(() => {
    if (senderId && roomId) {
      fetchRoomDetails();
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [senderId, roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRoomDetails = async () => {
    try {
      const details = await ChatRoom.get(roomId);
      setRoomDetails(details);
    } catch (error) {
      console.error("Error fetching room details:", error);
      toast({ title: "Error", description: "Could not load room details.", variant: "destructive" });
      router.push(createPageUrl('home'));
    }
  };

  const fetchMessages = async () => {
    if (!roomId) return;
    try {
      const messageData = await ChatMessage.filter({ roomId: roomId }, "createdAt:asc");
      setMessages(messageData);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (content: string, attachmentUrl?: string, attachmentType?: 'image' | 'video' | 'audio') => {
    if ((!content.trim() && !attachmentUrl) || !roomId) return;

    const newMessage = {
      roomId: roomId,
      content,
      senderName,
      senderId,
      attachmentUrl: attachmentUrl || null,
      attachmentType: attachmentType || 'text',
    };

    try {
      const createdMessage = await ChatMessage.create(newMessage);
      setMessages(prevMessages => [...prevMessages, { ...newMessage, id: createdMessage.id, createdAt: new Date().toISOString() }]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: 'Error', description: 'Failed to send message.', variant: 'destructive' });
    }
  };

  const handleUsernameChange = async () => {
    if (!tempUsername.trim()) {
      toast({ title: 'Error', description: 'Username cannot be empty.', variant: 'destructive' });
      return;
    }
    localStorage.setItem('blackchat_senderName', tempUsername.trim());
    setSenderName(tempUsername.trim());
    toast({ title: 'Success', description: 'Username updated!' });
    setIsSettingsOpen(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!senderId || !roomDetails) {
    return <div className="flex items-center justify-center h-screen bg-background text-foreground">Loading Chat...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center p-4 border-b border-border shadow-md">
        <Button variant="ghost" size="icon" onClick={() => router.push(createPageUrl('home'))}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="ml-4 flex-grow">
          <h1 className="text-xl font-bold">{roomDetails.name}</h1>
          <p className="text-sm text-muted-foreground">{roomDetails.description}</p>
        </div>
        
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>Change your display name here.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">Username</Label>
                <Input
                  id="username"
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  className="col-span-3"
                  onKeyPress={(e) => e.key === 'Enter' && handleUsernameChange()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUsernameChange}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <Message
            key={msg.id}
            message={msg}
            isCurrentUser={msg.senderId === senderId}
          />
        ))}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 border-t border-border">
        <MessageInput onSendMessage={handleSendMessage} senderName={senderName} />
      </footer>
    </div>
  );
};

export default ChatRoomPage;