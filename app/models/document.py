from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    file_size = Column(Integer, nullable=True, default=0)
    page_count = Column(Integer, nullable=True, default=0)
    status = Column(String, default="indexed")
    uploaded_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    user = relationship("User", back_populates="documents")