from sqlalchemy.orm import Session
from app.models.user import User


def create_user(db: Session, name: str, email: str, hashed_password: str) -> User:
    user = User(
        name=name,
        email=email.lower().strip(),
        hashed_password=hashed_password,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email.lower().strip()).first()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()
