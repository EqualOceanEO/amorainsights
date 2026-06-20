import socket, sys
ports = [7890, 7891, 1080, 1087, 15236, 15237, 8080, 8118]
for p in ports:
    s = socket.socket()
    s.settimeout(0.5)
    try:
        s.connect(('127.0.0.1', p))
        print(f'OPEN: {p}')
    except:
        print(f'CLOSED: {p}')
    finally:
        s.close()
