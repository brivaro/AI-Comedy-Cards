from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..db import crud, models, schemas
from ..db.database import get_db
from .auth import get_current_user
import logging
from sqlalchemy.exc import NoResultFound

router = APIRouter(prefix="/api/v1/store", tags=["Store"])

@router.post("/purchase")
def purchase_item(payload: dict, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Compra un item simple: payload debe contener `cost` (int) y opcionalmente `item_id`.
    Si el usuario tiene suficientes monedas, se descuentan y se devuelve el nuevo balance.
    """
    cost = payload.get('cost')
    item_id = payload.get('item_id', None)
    if cost is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Falta el coste del item.")
    try:
        # Perform update + purchase creation and commit manually to avoid nested transaction errors
        try:
            # optional: lock user row for update if supported
            try:
                user_row = db.query(models.User).filter(models.User.id == current_user.id).with_for_update().one()
            except Exception:
                user_row = db.query(models.User).filter(models.User.id == current_user.id).one()
        except NoResultFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

        if (user_row.coins or 0) < int(cost):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Fondos insuficientes")

        # deduct and create purchase
        user_row.coins = (user_row.coins or 0) - int(cost)
        db.add(user_row)
        purchase = crud.create_purchase(db=db, user_id=current_user.id, item_id=item_id or "unknown", cost=int(cost))

        # commit once
        db.commit()

        logging.info(f"Usuario {current_user.username} compró item {item_id} por {cost} monedas. Nuevo balance: {user_row.coins}")
        return {"success": True, "coins": user_row.coins, "purchase": {
            "id": purchase.id,
            "user_id": purchase.user_id,
            "item_id": purchase.item_id,
            "cost": purchase.cost,
            "created_at": purchase.created_at
        }}
    except HTTPException:
        # re-raise known client errors
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        logging.exception("Error procesando la compra")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error interno al procesar la compra")


@router.get("/purchases")
def list_purchases(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Devuelve el inventario (historial de compras) del usuario autenticado."""
    purchases = crud.get_user_purchases(db, current_user.id)
    return {
        "purchases": [
            schemas.PurchaseInDB.model_validate(purchase, from_attributes=True)
            for purchase in purchases
        ]
    }