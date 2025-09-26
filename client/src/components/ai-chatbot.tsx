import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, X, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Message[]>([]);
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const chatMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest("POST", "/api/ai/chat", { prompt, history });
      return response.json();
    },
    onSuccess: (data) => {
      setHistory((prev) => [
        ...prev,
        { role: 'model', parts: [{ text: data.response }] },
      ]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: Message = { role: 'user', parts: [{ text: input }] };
    setHistory((prev) => [...prev, userMessage]);
    chatMutation.mutate(input);
    setInput("");
  };

  useEffect(() => {
    // Scroll to the bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [history]);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full w-16 h-16 bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
        >
          {isOpen ? <X /> : <Bot />}
        </Button>
      </div>

      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-50 w-80 h-96 flex flex-col shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">AI Tutor</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {history.map((msg, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-3",
                      msg.role === 'user' ? "justify-end" : ""
                    )}
                  >
                    {msg.role === 'model' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary text-white">AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "p-3 rounded-lg max-w-xs",
                        msg.role === 'user'
                          ? "bg-primary text-white"
                          : "bg-muted"
                      )}
                    >
                      <p className="text-sm">{msg.parts[0].text}</p>
                    </div>
                    {msg.role === 'user' && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.profileImageUrl || undefined} />
                        <AvatarFallback>{user?.firstName?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-white">AI</AvatarFallback>
                    </Avatar>
                    <div className="p-3 rounded-lg bg-muted">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <form onSubmit={handleSubmit} className="p-4 border-t">
              <div className="relative">
                <Textarea
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  className="pr-12 resize-none"
                  rows={1}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute top-1/2 right-2 -translate-y-1/2 w-8 h-8"
                  disabled={chatMutation.isPending}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
}