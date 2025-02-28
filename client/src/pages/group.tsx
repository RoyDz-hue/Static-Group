import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { getGroup } from "@/lib/groups";
import { getCurrentUser } from "@/lib/auth";
import ChatWindow from "@/components/chat/ChatWindow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Group, User } from "@shared/schema";

export default function GroupPage() {
  const [, params] = useRoute("/group/:id");
  const [group, setGroup] = useState<Group | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (params?.id) {
        const [groupData, userData] = await Promise.all([
          getGroup(params.id),
          getCurrentUser()
        ]);
        setGroup(groupData);
        setUser(userData);
        setLoading(false);
      }
    };

    loadData();
  }, [params?.id]);

  if (loading || !group || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!group.members.includes(user.uid)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              You are not a member of this group
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{group.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{group.description}</p>
        </CardContent>
      </Card>

      <ChatWindow
        groupId={group.id}
        userId={user.uid}
        userDisplayName={user.displayName}
      />
    </div>
  );
}
