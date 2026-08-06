"""Standard API response helpers for a consistent envelope."""


def success(data=None, message="Success"):
    return {"success": True, "message": message, "data": data}


def failure(message="Something went wrong.", data=None):
    return {"success": False, "message": message, "data": data}