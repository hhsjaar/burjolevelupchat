export type Contact = {
    id: string
    wa_id: string
    name: string | null
    push_name: string | null
    profile_pic_url: string | null
    created_at: string
}

export type Conversation = {
    id: string
    contact_id: string
    status: 'active' | 'resolved' | 'blocked'
    last_message_at: string
    unread_count: number
    ai_mode: boolean
    pinned: boolean
    tags: string[]
    contact?: Contact
}

export type Message = {
    id: string
    conversation_id: string
    sender: 'user' | 'ai' | 'admin' | 'system'
    content: string
    media_url: string | null
    media_type: 'image' | 'video' | 'document' | null
    status: 'sent' | 'delivered' | 'read' | 'failed'
    created_at: string
}

export type Reservation = {
    id: string
    contact_id: string
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    start_time: string
    end_time: string
    details: any
    google_event_id: string | null
}
