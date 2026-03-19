from typing import Any, Dict, Optional

from rest_framework.response import Response


def api_response(*, data: Optional[Any] = None, message: str = "", status_code: int = 200) -> Response:
    payload: Dict[str, Any] = {"message": message}
    if data is not None:
        payload["data"] = data
    return Response(payload, status=status_code)
