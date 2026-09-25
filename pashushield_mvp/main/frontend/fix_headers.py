import os
import glob

search_str = 'https://lh3.googleusercontent.com/aida/AEtjO1XLDFrDglF2n3r1uftl6goq7UaqNywM2Y8F1AiGpEF9f2yjmaeRYSn6PlDywK2f9wJ1UUksm88RBO2IVnE0Ww_w3t1JskqMyVGZCs4ChjZiCwmC0Zv6qG8IENUxijWZ3KJXLy6oS21lwJg1Bi3e7vYCnNIWDJ96uf5OVMlXqGR4YTnqu595XvzdXTj-U_OT2TihUn11A2hBufR-4lKiCjQHOPqDL75oLHa3ZzgdWwWO4m0_jvF6QCL-MM4'
replace_str = ''

files = glob.glob('src/app/**/*.tsx', recursive=True)

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if search_str in content:
        # We replace the img tag with material icon
        # Actually it's safer to do regex replacement of the entire img tag
        import re
        content = re.sub(
            r'<img[^>]*src="https://lh3\.googleusercontent\.com/aida/AEtjO1X[^"]*"[^>]*>',
            '<span className="material-symbols-outlined text-[32px] text-telemetry-saffron flex-shrink-0">shield</span>',
            content
        )
        
        # Make headers wrap and responsive
        content = content.replace('h-24 flex flex-col justify-center px-6', 'h-auto min-h-20 flex flex-col justify-center px-3 py-2 md:px-6')
        content = content.replace('h-16 w-full px-4 md:px-6 flex items-center justify-between gap-4', 'h-auto min-h-16 w-full py-2 px-3 md:px-6 flex flex-wrap items-center justify-between gap-2')
        content = content.replace('px-2 py-0.5 bg-surface-panel-active text-radar-emerald font-label-sm uppercase rounded', 'hidden sm:inline-block px-2 py-0.5 bg-surface-panel-active text-radar-emerald font-label-sm uppercase rounded')
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
            print(f"Fixed {file}")
