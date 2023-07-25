def convert_css_to_percentage(css_file_path):
    with open(css_file_path, 'r') as file:
        css_content = file.read()

    def convertBackgroundPos(match):
        width = float(match.group(1))
        height = float(match.group(2))
        width_percentage = (width / 1588) * 100
        height_percentage = (height / 1077) * 100
        return f'{width_percentage:.2f}% {height_percentage:.2f}%'

    def convertWidth(match):
        width = float(match.group(1))
        width_percentage = (width / 1588) * 100
        return f'width: {width_percentage:.2f}%'

    def convertHeight(match):
        height = float(match.group(1))
        height_percentage = (height / 1077) * 100
        return f'height: {height_percentage:.2f}%'

        # Regular expression to find two consecutive 'px' values in the CSS file
    import re
    backgroundPos_pattern = r'-(\d+)px\s+-(\d+)px'
    width_pattern = r'width: (\d+)px'
    height_pattern = r'height: (\d+)px'

    # Replace 'px' values with percentages in the CSS file
    css_content = re.sub(backgroundPos_pattern,
                         convertBackgroundPos, css_content)
    css_content = re.sub(width_pattern,
                         convertWidth, css_content)
    css_content = re.sub(height_pattern,
                         convertHeight, css_content)

    with open('converted.css', 'w') as converted_file:
        converted_file.write(css_content)


if __name__ == "__main__":
    css_file_path = "spritestyle.css"
    convert_css_to_percentage(css_file_path)
