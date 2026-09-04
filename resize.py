import re

with open("src/pages/Settings.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Replace massive paddings and margins in Support card
text = text.replace('rounded-[2rem] md:rounded-[2.5rem]', 'rounded-3xl md:rounded-[2rem]')
text = text.replace('p-6 md:p-8', 'p-5 md:p-6')
text = text.replace('w-12 h-12 md:w-14 md:h-14', 'w-10 h-10 md:w-12 md:h-12')
text = text.replace('w-6 h-6 md:w-7 md:h-7', 'w-5 h-5 md:w-6 md:h-6')
text = text.replace('text-xl md:text-2xl', 'text-lg md:text-xl')
text = text.replace('mb-6 md:mb-8 flex items-center', 'mt-4 flex items-center')

with open("src/pages/Settings.tsx", "w", encoding="utf-8") as f:
    f.write(text)
print("Updated!")
