import sqlite3
import json
import os

def convert_db_to_json_by_year():
    # Create the events directory if it doesn't exist
    if not os.path.exists('events'):
        os.makedirs('events')

    conn = sqlite3.connect('persian_holiday.db')
    cursor = conn.cursor()
    cursor.execute("SELECT year, month, day, event, is_holiday FROM events ORDER BY year")

    current_year = None
    year_data = {}

    for row in cursor.fetchall():
        year, month, day, event, is_holiday = row

        if year != current_year:
            if current_year is not None:
                # Save the previous year's data
                with open(f'events/events_{current_year}.json', 'w', encoding='utf-8') as f:
                    json.dump(year_data, f, ensure_ascii=False, indent=4)

            # Start a new year
            current_year = year
            year_data = {}

        if month not in year_data:
            year_data[month] = {}
        if day not in year_data[month]:
            year_data[month][day] = []

        year_data[month][day].append({
            "title": event,
            "is_holiday": bool(is_holiday)
        })

    # Save the last year's data
    if current_year is not None:
        with open(f'events/events_{current_year}.json', 'w', encoding='utf-8') as f:
            json.dump(year_data, f, ensure_ascii=False, indent=4)

    conn.close()
    print("Yearly event JSON files created successfully in 'events' directory.")

if __name__ == '__main__':
    convert_db_to_json_by_year()
