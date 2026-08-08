from sqlalchemy.orm import Session
from app.models.conversation import Conversation


def create_conversation(db: Session, user_id: int | None = None, title: str | None = "New Conversation") -> Conversation:
    conversation = Conversation(user_id=user_id, title=title)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def get_conversation(db: Session, conversation_id: int, user_id: int | None = None) -> Conversation | None:
    query = db.query(Conversation).filter(Conversation.id == conversation_id)
    if user_id is not None:
        query = query.filter(Conversation.user_id == user_id)
    return query.first()


def get_conversations_by_user(db: Session, user_id: int | None = None):
    query = db.query(Conversation)
    if user_id is not None:
        query = query.filter(Conversation.user_id == user_id)
    return query.order_by(Conversation.updated_at.desc()).all()


def update_conversation_title(db: Session, conversation_id: int, title: str, user_id: int | None = None) -> Conversation | None:
    conv = get_conversation(db, conversation_id, user_id)
    if conv:
        conv.title = title
        db.commit()
        db.refresh(conv)
    return conv


def delete_conversation(db: Session, conversation_id: int, user_id: int | None = None) -> bool:
    conv = get_conversation(db, conversation_id, user_id)
    if conv:
        db.delete(conv)
        db.commit()
        return True
    return False