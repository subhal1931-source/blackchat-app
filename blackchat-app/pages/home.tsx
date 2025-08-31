import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Heart, PlusCircle, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { createPageUrl } from '@/utils';
import { ChatRoom } from '@/entities/ChatRoom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import AnimatedLogo from '@/components/AnimatedLogo';

const HomePage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [hasUsername, setHasUsername] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const savedUsername = localStorage.getItem('blackchat_senderName');
    if (savedUsername) {
      setUsername(savedUsername);
      setHasUsername(true);
      fetchRooms();
    }
  }, []);

  const fetchRooms = async () => {
    try {
      const roomData = await ChatRoom.list("createdAt:desc");
      setRooms(roomData);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast({ title: "Error", description: "Could not fetch chat rooms.", variant: "destructive" });
    }
  };

  const handleSetUsername = () => {
    if (!username.trim()) {
      toast({
        title: 'Username required',
        description: 'Please enter a username to continue.',
        variant: 'destructive',
      });
      return;
    }
    
    let senderId = localStorage.getItem('blackchat_senderId');
    if (!senderId) {
      senderId = Date.now().toString(36) + Math.random().toString(36).substring(2);
      localStorage.setItem('blackchat_senderId', senderId);
    }
    localStorage.setItem('blackchat_senderName', username.trim());
    setHasUsername(true);
    fetchRooms();
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      toast({ title: "Error", description: "Room name cannot be empty.", variant: "destructive" });
      return;
    }
    try {
      await ChatRoom.create({
        name: newRoomName,
        description: newRoomDescription,
        creatorName: username,
      });
      toast({ title: "Success", description: "New chat room created!" });
      setNewRoomName('');
      setNewRoomDescription('');
      setIsCreateRoomOpen(false);
      fetchRooms();
    } catch (error) {
      console.error("Error creating room:", error);
      toast({ title: "Error", description: "Failed to create room.", variant: "destructive" });
    }
  };

  if (!hasUsername) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mb-4">
              <AnimatedLogo size="large" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome!</CardTitle>
            <CardDescription>Enter your username to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 text-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleSetUsername()}
              />
              <Button onClick={handleSetUsername} className="w-full h-12 text-lg" size="lg">
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center">
              <AnimatedLogo />
              <span className="text-foreground text-3xl font-bold ml-4">Rooms</span>
            </div>
          </div>
          <Dialog open={isCreateRoomOpen} onOpenChange={setIsCreateRoomOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="w-5 h-5 mr-2" />
                Create Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Chat Room</DialogTitle>
                <DialogDescription>Give your new room a name and an optional description.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="room-name">Room Name</Label>
                  <Input id="room-name" value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="room-desc">Description</Label>
                  <Textarea id="room-desc" value={newRoomDescription} onChange={(e) => setNewRoomDescription(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateRoomOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateRoom}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => (
            <Card key={room.id} className="hover:shadow-primary/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  {room.name}
                </CardTitle>
                <CardDescription>{room.description || 'No description.'}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Created by: {room.creatorName}</p>
                <Button className="w-full mt-4" onClick={() => router.push(createPageUrl('ChatRoom', { id: room.id }))}>
                  Join Room
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {rooms.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p>No rooms available yet.</p>
            <p>Why not create the first one?</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;