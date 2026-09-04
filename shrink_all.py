import re

with open("src/pages/Settings.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Make the outer container tighter
text = text.replace('py-6 md:py-10 max-w-[1200px]', 'py-4 md:py-6 max-w-[1000px]')

# Sidebar tweaks
text = text.replace('w-full md:w-[280px] lg:w-[320px]', 'w-full md:w-[240px] lg:w-[280px]')
text = text.replace('p-4 md:p-6 rounded-[2rem]', 'p-4 rounded-[1.5rem]')
text = text.replace('mb-6 md:mb-10', 'mb-6')
text = text.replace('p-3 md:p-4 rounded-2xl', 'p-3 rounded-xl')
text = text.replace('w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-xl', 'w-8 h-8 md:w-9 md:h-9 shrink-0 rounded-lg')

# Main Content box overall tweaks
text = text.replace('min-h-[500px]', 'min-h-[400px]')
text = text.replace('rounded-[2rem] md:rounded-[3rem]', 'rounded-[1.5rem]')
text = text.replace('p-6 md:p-10', 'p-5 md:p-6')
text = text.replace('mb-8 md:mb-10', 'mb-6 md:mb-8')
text = text.replace('w-12 h-12 md:w-16 md:h-16', 'w-10 h-10 md:w-12 md:h-12')
text = text.replace('w-6 h-6 md:w-8 md:h-8', 'w-5 h-5 md:w-6 md:h-6')
text = text.replace('text-2xl md:text-3xl', 'text-xl md:text-2xl')

# Preferences inner boxes
text = text.replace('p-4 md:p-6 rounded-2xl md:rounded-3xl', 'p-3 md:p-4 rounded-xl')

# Danger zone and notifications
text = text.replace('p-4 md:p-5 gap-4 rounded-2xl', 'p-3 md:p-4 gap-3 rounded-xl')

with open("src/pages/Settings.tsx", "w", encoding="utf-8") as f:
    f.write(text)
print("UI shrunk successfully.")
