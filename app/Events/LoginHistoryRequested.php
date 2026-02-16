<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LoginHistoryRequested implements ShouldBroadcast, ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * 请求查看登录历史的教师信息
     */
    public User $teacher;

    /**
     * 请求时间
     */
    public string $requestedAt;

    /**
     * 目标学生ID（如果为null则广播给所有学生）
     */
    public ?int $targetStudentId;

    /**
     * Create a new event instance.
     */
    public function __construct(User $teacher, ?int $targetStudentId = null)
    {
        $this->teacher = $teacher;
        $this->targetStudentId = $targetStudentId;
        $this->requestedAt = now()->toISOString();
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        // 如果指定了目标学生，只广播给该学生
        if ($this->targetStudentId) {
            \Log::info('[事件] 广播到私有频道', [
                'channel' => 'student.'.$this->targetStudentId,
                'target_student_id' => $this->targetStudentId,
            ]);

            return [
                new PrivateChannel('student.'.$this->targetStudentId),
            ];
        }

        // 否则广播给所有学生（使用公共频道）
        \Log::info('[事件] 广播到公共频道', ['channel' => 'students']);

        return [
            new Channel('students'),
        ];
    }

    /**
     * 广播事件名称
     */
    public function broadcastAs(): string
    {
        return 'login.history.requested';
    }

    /**
     * 广播数据
     */
    public function broadcastWith(): array
    {
        return [
            'teacher' => [
                'id' => $this->teacher->id,
                'name' => $this->teacher->name,
            ],
            'requested_at' => $this->requestedAt,
            'message' => '教师请求查看你的登录记录',
        ];
    }
}
