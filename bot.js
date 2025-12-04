import logging
from telegram import (
    Update,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    InputMediaPhoto,
)
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    ContextTypes,
    filters,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

TOKEN = "YOUR_BOT_TOKEN"

ADMIN_ID = 1990156236   # Sening ID

# Karta
CARD_NUMBER = "9860 3501 4574 4735"
CARD_NAME = "A.Karimxo'ja"

# Video obzor postlari
PUBG_REVIEW = "https://t.me/XOJA_ARENDA/906"
MLBB_REVIEW = "https://t.me/XOJA_ARENDA/907"


# ---------------- START ----------------
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton("🇺🇿 O‘zbekcha", callback_data="lang_uz")],
        [InlineKeyboardButton("🇷🇺 Русский", callback_data="lang_ru")],
    ]
    await update.message.reply_text("Choose language / Tilni tanlang", reply_markup=InlineKeyboardMarkup(keyboard))


# ---------------- TIL TANLASH ----------------
async def choose_lang(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    lang = query.data.split("_")[1]
    context.user_data["lang"] = lang

    if lang == "uz":
        text = "Quyidagi o‘yinlardan birini tanlang:"
    else:
        text = "Выберите одну из игр:"

    keyboard = [
        [InlineKeyboardButton("🎮 PUBG", callback_data="game_pubg")],
        [InlineKeyboardButton("⚔️ MLBB", callback_data="game_mlbb")],
    ]

    await query.edit_message_text(text, reply_markup=InlineKeyboardMarkup(keyboard))


# ---------------- O‘YIN TANLASH ----------------
async def game_selected(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    game = query.data.split("_")[1]
    lang = context.user_data.get("lang", "uz")

    # Video obzor forward
    if game == "pubg":
        review = PUBG_REVIEW
        name = "PUBG Mobile"
        price = "25 000 so’m / 24 soat"
        price_ru = "25 000 сум / 24 часа"
    else:
        review = MLBB_REVIEW
        name = "MLBB"
        price = "20 000 so’m / 24 soat"
        price_ru = "20 000 сум / 24 часа"

    # VIDEO FORWARD
    await query.message.reply_text(f"🔄 Video obzor yuklanmoqda…")
    await context.bot.forward_message(
        chat_id=update.effective_chat.id,
        from_chat_id=review.split("/")[-2],
        message_id=int(review.split("/")[-1])
    )

    # INFO
    if lang == "uz":
        text = (
            f"📦 *{name} Akkaunt Arenda*\n\n"
            f"💰 *Narx:* {price}\n"
            f"⏳ *Muddati:* 24 soat\n"
            f"📌 *Tavsif:* Premium, cheklanmagan, to‘liq xavfsiz.\n\n"
            f"💳 *To‘lov kartasi:* `{CARD_NUMBER}`\n"
            f"👤 *Ism:* {CARD_NAME}\n\n"
            "To‘lovni qilgach, chekni shu yerga yuboring."
        )
    else:
        text = (
            f"📦 *Аренда аккаунта {name}*\n\n"
            f"💰 *Цена:* {price_ru}\n"
            f"⏳ *Срок:* 24 часа\n"
            f"📌 *Описание:* Премиум, безопасность 100%.\n\n"
            f"💳 *Карта:* `{CARD_NUMBER}`\n"
            f"👤 *Имя:* {CARD_NAME}\n\n"
            "После оплаты отправьте чек сюда."
        )

    await query.message.reply_text(text, parse_mode="Markdown")


# ---------------- CHEK QABUL QILISH ----------------
async def receive_check(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user

    # faqat rasm yoki fayl
    if not (update.message.photo or update.message.document):
        return

    # ADMINga yuborish
    keyboard = [
        [
            InlineKeyboardButton(
                "✅ Tasdiqlash", callback_data=f"confirm_{user.id}"
            )
        ]
    ]

    await update.message.forward(ADMIN_ID)
    await context.bot.send_message(
        ADMIN_ID,
        f"📨 *Yangi to‘lov cheki*\n👤 Foydalanuvchi: {user.first_name}\n🆔 ID: {user.id}",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

    await update.message.reply_text("⏳ Chekingiz adminga yuborildi. Kuting…")


# ---------------- ADMIN TASDIQLASH ----------------
async def admin_confirm(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    user_id = query.data.split("_")[1]

    # Foydalanuvchiga xabar
    await context.bot.send_message(
        chat_id=int(user_id),
        text="✅ To‘lov qabul qilindi! Rahmat!"
    )

    await query.edit_message_text("✔ Tasdiqlandi. Foydalanuvchiga xabar yuborildi.")

    # Admin uchun qo‘shimcha
    await context.bot.send_message(
        ADMIN_ID,
        f"💰 To‘lov tasdiqlandi.\n🆔 Foydalanuvchi: {user_id}"
    )


# ---------------- MAIN ----------------
def main():
    app = ApplicationBuilder().token(TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(choose_lang, pattern="lang_"))
    app.add_handler(CallbackQueryHandler(game_selected, pattern="game_"))
    app.add_handler(CallbackQueryHandler(admin_confirm, pattern="confirm_"))
    app.add_handler(MessageHandler(filters.ALL & ~filters.COMMAND, receive_check))

    app.run_polling()


if __name__ == "__main__":
    main()
