from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db
from ..dependencies import get_current_user, get_current_admin
from ..models.review import Review
from ..schemas.review import ReviewCreate, ReviewOut
from ..crud.review import (
    create_review,
    get_reviews_by_application,
    get_reviews_by_reviewer,
    has_submitted_review,
    update_review,
    delete_review,
)

router = APIRouter(prefix="/reviews", tags=["reviews"])

# Reviewer: Submit a review
@router.post("/", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def submit_review(
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    if has_submitted_review(db, review_in.application_id, current_user.id):
        raise HTTPException(status_code=400, detail="Review already submitted")
    return create_review(db, review_in, current_user.id)

# Reviewer: List all my reviews
@router.get("/me", response_model=List[ReviewOut])
def list_my_reviews(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    return get_reviews_by_reviewer(db, current_user.id)

# Reviewer: Get my review for a specific application
@router.get("/applications/{application_id}/my-review", response_model=ReviewOut)
def get_my_review_for_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    review = db.query(Review).filter(
        Review.application_id == application_id,
        Review.reviewer_id == current_user.id
    ).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review

# Admin: List all reviews for an application
@router.get("/applications/{application_id}/reviews", response_model=List[ReviewOut])
def list_reviews_for_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin),
):
    return get_reviews_by_application(db, application_id)

# Admin: Update a review
@router.patch("/{review_id}", response_model=ReviewOut)
def admin_update_review(
    review_id: int,
    score: int,
    comment: str | None = None,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin),
):
    return update_review(db, review_id, score, comment)

# Admin: Delete a review
@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin),
):
    deleted = delete_review(db, review_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Review not found")
    return None
