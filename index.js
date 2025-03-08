import json
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, CallbackContext, ConversationHandler
from telegram.constants import ParseMode

# Sample JSON data
data = {
  "courses": [
    {"name": "ENGLISH"},
    {"name": "MATHEMATICS"},
    {"name": "GENERAL SCIENCE"},
    {"name": "SOCIAL SCIENCE"},
    {"name": "CITIZENSHIP EDUCATION"},
    {"name": "AMHARIC"}
  ],
  "student": {
    "age": 14,
    "name": "HANOS TAFESSE ALEMU",
    "photo": "https://assets.sw.ministry.et/2017/student-photo/1739542829-44705-29217/6002047-0099617.jpeg",
    "school": "KAFFA CHATOLIC NO2",
    "woreda": "BONGA",
    "zone": "KAFA",
    "language": "Amharic",
    "gender": "Female",
    "nationality": "Ethiopian",
    "stud_info": [
      ["nationality", "language"],
      ["zone", "woreda"],
      ["school"]
    ]
  }
}

def format_student_result(data):
    """Format the student result into a styled HTML message."""
    student = data["student"]
    courses = data["courses"]

    # Student Information
    student_info = (
        f"<b>🎓 Student Information:</b>\n"
        f"<b>Name:</b> {student['name']}\n"
        f"<b>Age:</b> {student['age']}\n"
        f"<b>Gender:</b> {student['gender']}\n"
        f"<b>Nationality:</b> {student['nationality']}\n"
        f"<b>Language:</b> {student['language']}\n"
        f"<b>School:</b> {student['school']}\n"
        f"<b>Woreda:</b> {student['woreda']}\n"
        f"<b>Zone:</b> {student['zone']}\n"
    )

    # Courses
    courses_list = "\n".join([f"- {course['name']}" for course in courses])
    courses_info = f"<b>📚 Courses:</b>\n{courses_list}"

    # Photo
    photo_info = f"<b>📸 Photo:</b> <a href='{student['photo']}'>View Photo</a>"

    # Combine all sections
    formatted_result = f"{student_info}\n{courses_info}\n\n{photo_info}"
    return formatted_result

async def start(update: Update, context: CallbackContext) -> None:
    """Send the formatted result when the /start command is issued."""
    formatted_result = format_student_result(data)
    await update.message.reply_text(formatted_result, parse_mode=ParseMode.HTML)

    # Send the photo separately
    photo_url = data["student"]["photo"]
    await update.message.reply_photo(photo=photo_url)

def main() -> None:
    """Start the bot."""
    # Replace with your actual bot token
    TELEGRAM_BOT_TOKEN = "YOUR_TELEGRAM_BOT_TOKEN"

    # Create the Application and pass it your bot's token.
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

    # Register the /start command handler
    application.add_handler(CommandHandler("start", start))

    # Start the Bot
    application.run_polling()

if __name__ == "__main__":
    main()
