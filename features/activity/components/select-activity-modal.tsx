"use client";

import { useState } from "react";
import { Search, Loader2, ClipboardCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActivitiesQuery } from "../hooks/use-activity-query";
import { useRouter } from "next/navigation";

interface SelectActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SelectActivityModal = ({ isOpen, onClose }: SelectActivityModalProps) => {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const { data: activities, isLoading } = useActivitiesQuery();

    const filteredActivities = activities?.filter((activity) =>
        activity.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (id: number) => {
        router.push(`/activities/${id}/attendance`);
        onClose();
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setSearch("");
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className='sm:max-w-[500px] gap-0 p-0 overflow-hidden rounded-2xl'>
                <DialogHeader className='p-6 pb-0'>
                    <DialogTitle className="text-xl font-bold">Select Activity</DialogTitle>
                    <DialogDescription>
                        Choose an activity to manage its attendance.
                    </DialogDescription>
                </DialogHeader>

                <div className='p-6 space-y-4'>
                    <div className='relative'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400' />
                        <Input
                            placeholder='Search activities...'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className='pl-10 h-11 rounded-xl border-zinc-200 dark:border-zinc-800'
                        />
                    </div>

                    <div className='max-h-[350px] overflow-y-auto pr-2 space-y-2 custom-scrollbar'>
                        {isLoading ? (
                            <div className='flex flex-col items-center justify-center py-20 gap-3'>
                                <Loader2 className='w-8 h-8 animate-spin text-blue-500' />
                                <p className='text-sm text-zinc-500 animate-pulse'>Loading activities...</p>
                            </div>
                        ) : filteredActivities?.length === 0 ? (
                            <div className='text-center py-16 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800'>
                                <p className='text-zinc-500 text-sm'>No activities found matching your search.</p>
                            </div>
                        ) : (
                            filteredActivities?.map((activity) => (
                                <div
                                    key={activity.id}
                                    onClick={() => handleSelect(activity.id)}
                                    className='flex items-center gap-4 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 cursor-pointer transition-all duration-200 group'
                                >
                                    <div className='w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-900/40 dark:group-hover:text-blue-400 transition-colors'>
                                        <ClipboardCheck size={24} />
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-base font-bold text-zinc-900 dark:text-zinc-100 truncate'>
                                            {activity.name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">ID: {activity.id}</span>
                                            {activity._count?.activityRegistrations !== undefined && (
                                                <span className="text-xs text-zinc-500">{activity._count.activityRegistrations} people</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className='flex items-center justify-end p-6 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800'>
                    <Button variant='outline' onClick={onClose} className='rounded-xl border-zinc-200 dark:border-zinc-800'>
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
