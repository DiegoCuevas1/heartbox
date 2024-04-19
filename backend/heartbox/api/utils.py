def is_name_valid(name):
    if not name:
        return False
    name_size = len(name)
    return name_size > 0 and name_size <= 20