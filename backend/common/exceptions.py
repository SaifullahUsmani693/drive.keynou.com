from typing import Any, Dict

from rest_framework.views import exception_handler


def api_exception_handler(exc: Exception, context: Dict[str, Any]):
    response = exception_handler(exc, context)
    if response is None:
        return response

    message = "Request failed."
    if isinstance(response.data, dict):
        if "detail" in response.data:
            message = response.data["detail"]
        elif response.data:
            first_key = next(iter(response.data))
            value = response.data.get(first_key)
            if isinstance(value, list) and value:
                message = value[0]
            elif value:
                message = value

    response.data = {"message": message}
    return response
