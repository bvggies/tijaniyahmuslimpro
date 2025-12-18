import { Card } from '@tmp/ui';

export function ChatModerationPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-emerald-50">Chat moderation</h1>
      <Card className="px-4 py-3">
        <div className="text-xs text-emerald-100/80 mb-2">
          Supervise 1-1 and group chat rooms using the `ChatRoom`, `ChatRoomMember`, and `Message` models.
        </div>
      </Card>
    </div>
  );
}


