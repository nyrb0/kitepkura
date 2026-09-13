# Первое внедрение миграций в существующую базу

Подготовлены для Prisma 7 / PostgreSQL:
- `baseline.prisma` — неизменяемый снимок схемы до добавления deadline;
- `migrations/0_init` — начальная структура (на существующей базе только отмечается выполненной);
- `migrations/20260914000000_add_post_deadline` — nullable deadline и индекс.

Production-база при подготовке файлов не проверялась и не изменялась. Baseline
сгенерирован из прежнего schema.prisma. Сначала отрепетируйте весь порядок на
восстановленной копии production. Если есть собственные триггеры, views или другие
объекты вне Prisma, отдельно проверьте их и воспроизводимость начальной миграции.

## Docker Compose: первый запуск на существующей базе

Команды выполняются из корня проекта на сервере, где используется поставляемый
docker-compose.yml. Выполняйте по одной и продолжайте только после успеха.
Не запускайте новый backend через `up` до завершения baseline: его стартовая
команда теперь выполняет `migrate deploy` вместо `db push`.

1. Сделайте резервную копию. Выберите новое имя файла, если оно уже существует:

```sh
docker compose exec -T postgres pg_dump -U postgres -d kitepkura -Fc -f /tmp/kitepkura-before-deadline.dump
docker compose cp postgres:/tmp/kitepkura-before-deadline.dump ./kitepkura-before-deadline.dump
```

Сохраните копию вне репозитория/сервера, проверьте восстановление в отдельную БД.
Не коммитьте дамп: он содержит production-данные.

2. Соберите новый образ (работающий backend пока продолжает работать):

```sh
docker compose build backend
```

3. Проверьте совпадение production со СТАРОЙ схемой (команда только читает БД):

```sh
docker compose run --rm --no-deps backend npx prisma migrate diff --from-config-datasource --to-schema prisma/baseline.prisma --exit-code
```

Только код выхода 0 и отсутствие различий разрешают следующий шаг.
Код 2 означает расхождения, код 1 — ошибку. В обоих случаях остановитесь:
нельзя просто отмечать baseline применённым. Если deadline уже добавлялся вручную,
этот сценарий также нужно сначала скорректировать.

4. Один раз отметьте начальную миграцию как уже применённую:

```sh
docker compose run --rm --no-deps backend npx prisma migrate resolve --applied 0_init
```

Это записывает историю Prisma, не создаёт заново существующие таблицы.
Не отмечайте `add_post_deadline` выполненной: она должна реально выполнить SQL.

5. Примените добавление поля и индекса:

```sh
docker compose run --rm --no-deps backend npx prisma migrate deploy
docker compose run --rm --no-deps backend npx prisma migrate status
docker compose run --rm --no-deps backend npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code
```

Ожидается отсутствие неприменённых миграций и различий (код 0).
При ошибке не перезапускайте новую версию и не используйте reset; сохраните вывод
для диагностики. Поле добавляется без NOT NULL и DEFAULT: старые записи получают
NULL. Создание обычного индекса блокирует запись на время построения; для большой
таблицы заранее выберите окно обслуживания или подготовьте отдельную стратегию
создания индекса CONCURRENTLY.

6. Запустите новый backend:

```sh
docker compose up -d --no-deps backend
docker compose logs --tail=100 backend
```

Dockerfile уже генерирует Prisma Client и собирает приложение. Проверьте чтение
существующих постов. Backend проверяет истёкшие сроки при старте, каждую минуту
и перед чтением списков/поста. В админке можно задать дату и время по Бишкеку.
Без deadline пост автоматически не архивируется. Для восстановления поста
перенесите или очистите deadline и выключите «В архиве». В API используйте ISO
8601 с часовым поясом; null или пустая строка очищает срок, отсутствие поля
при PATCH оставляет его прежним.

## Последующие деплои и новые базы

Для последующих изменений создавайте миграции через `prisma migrate dev` только
на базе разработки, коммитьте папку migrations и применяйте на production через
`prisma migrate deploy` (он также выполняется при старте контейнера).
`resolve --applied 0_init` повторять не нужно.

На НОВОЙ ПУСТОЙ базе не выполняйте `resolve`: обычный `migrate deploy` создаст
таблицы через 0_init и затем добавит deadline.

На production не используйте `migrate dev`, `migrate reset`, `db push` или
`docker compose down -v`. Не меняйте baseline.prisma и уже применённые миграции.
