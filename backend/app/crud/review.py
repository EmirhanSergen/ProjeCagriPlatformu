from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.review import Review
from app.schemas.review import ReviewCreate

# Create a new review
def create_review(db: Session, review_in: ReviewCreate, reviewer_id: int):
    review = Review(
        application_id=review_in.application_id,
        reviewer_id=reviewer_id,
        score=review_in.score,
        comment=review_in.comment,
    )
    db.add(review)
    try:
        db.commit()
        db.refresh(review)
        return review
    except IntegrityError:
        db.rollback()
        raise ValueError("Review already exists or invalid foreign key.")

# List all reviews for an application
def get_reviews_by_application(db: Session, application_id: int):
    return db.query(Review).filter(Review.application_id == application_id).all()

# List all reviews written by a reviewer
def get_reviews_by_reviewer(db: Session, reviewer_id: int):
    return db.query(Review).filter(Review.reviewer_id == reviewer_id).all()

# Check if reviewer already submitted review for this application
def has_submitted_review(db: Session, application_id: int, reviewer_id: int) -> bool:
    return db.query(Review).filter(
        Review.application_id == application_id,
        Review.reviewer_id == reviewer_id
    ).first() is not None

def update_review(db: Session, review_id: int, score: int, comment: str | None = None):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise ValueError("Review not found")
    review.score = score
    review.comment = comment
    db.commit()
    db.refresh(review)
    return review

def delete_review(db: Session, review_id: int) -> bool:
    review = db.query(Review).filter(Review.id == review_id).first()
    if review:
        db.delete(review)
        db.commit()
        return True
    return False