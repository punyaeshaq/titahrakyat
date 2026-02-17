import { useState, useEffect } from "react";
import { pollsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BarChart2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const PollWidget = () => {
    const queryClient = useQueryClient();
    const { data: pollData, isLoading } = useQuery({
        queryKey: ["activePoll"],
        queryFn: pollsApi.getActive,
    });

    const voteMutation = useMutation({
        mutationFn: ({ pollId, optionId }: { pollId: string; optionId: string }) =>
            pollsApi.vote(pollId, optionId),
        onSuccess: () => {
            toast.success("Terima kasih atas partisipasi Anda!");
            queryClient.invalidateQueries({ queryKey: ["activePoll"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal mengirim suara.");
        },
    });

    if (isLoading || !pollData) return null;

    const { poll, userVoted } = pollData;
    if (!poll) return null;

    const totalVotes = poll.options.reduce((sum: number, opt: any) => sum + opt.votes_count, 0);

    return (
        <div className="bg-card rounded-lg p-5 border border-border shadow-sm">
            <h2 className="flex items-center gap-2 font-bold font-serif text-foreground text-lg mb-4">
                <BarChart2 size={18} className="text-primary" />
                Polling Pembaca
            </h2>

            <h3 className="font-semibold text-base mb-4">{poll.question}</h3>

            <div className="space-y-3">
                {poll.options.map((option: any) => {
                    const percentage = totalVotes > 0 ? Math.round((option.votes_count / totalVotes) * 100) : 0;

                    if (userVoted) {
                        return (
                            <div key={option.id} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>{option.option_text}</span>
                                    <span className="font-bold">{percentage}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <div className="text-xs text-muted-foreground text-right">{option.votes_count} suara</div>
                            </div>
                        );
                    }

                    return (
                        <Button
                            key={option.id}
                            variant="outline"
                            className="w-full justify-start h-auto py-3 text-left whitespace-normal"
                            onClick={() => voteMutation.mutate({ pollId: poll.id, optionId: option.id })}
                            disabled={voteMutation.isPending}
                        >
                            {option.option_text}
                        </Button>
                    );
                })}
            </div>

            <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                <span>Total: {totalVotes} suara</span>
                {userVoted && <span>Anda sudah memilih</span>}
            </div>
        </div>
    );
};

export default PollWidget;
