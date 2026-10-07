import re
with open('src/routes/auth.routes.ts', 'r', encoding='utf-8') as f: data = f.read()
data = data.replace('\', '').replace('\$', '$')
with open('src/routes/auth.routes.ts', 'w', encoding='utf-8') as f: f.write(data)
with open('src/services/notification.service.ts', 'r', encoding='utf-8') as f: data = f.read()
data = data.replace('\', '').replace('\$', '$')
with open('src/services/notification.service.ts', 'w', encoding='utf-8') as f: f.write(data)
