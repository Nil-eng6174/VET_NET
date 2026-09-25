import os

with open('src/app/farmer/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the grid
content = content.replace('grid grid-cols-2 md:grid-cols-4 gap-4 mt-1 bg-surface-base p-4 rounded-lg', 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-1 bg-surface-base p-3 md:p-4 rounded-lg')

# Fix the main section padding
content = content.replace('p-6 shadow-sm rounded-xl mb-6', 'p-4 md:p-6 shadow-sm rounded-xl mb-4 md:mb-6')

# Fix gap in form
content = content.replace('flex flex-col gap-6 w-full', 'flex flex-col gap-4 md:gap-6 w-full')

# Fix text size in checkboxes
content = content.replace('text-lg">{t(\'farmer.addsymp.lethargy\')}', 'text-base md:text-lg">{t(\'farmer.addsymp.lethargy\')}')
content = content.replace('text-lg">{t(\'farmer.addsymp.nasal\')}', 'text-base md:text-lg">{t(\'farmer.addsymp.nasal\')}')
content = content.replace('text-lg">{t(\'farmer.addsymp.appetite\')}', 'text-base md:text-lg">{t(\'farmer.addsymp.appetite\')}')
content = content.replace('text-lg">{t(\'farmer.addsymp.abortion\')}', 'text-base md:text-lg">{t(\'farmer.addsymp.abortion\')}')

# Fix the 3-col grid
content = content.replace('grid grid-cols-1 md:grid-cols-3 gap-6 mt-2', 'grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-1 md:mt-2')

with open('src/app/farmer/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed farmer page responsiveness")
