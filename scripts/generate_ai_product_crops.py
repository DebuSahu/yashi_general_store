from PIL import Image
import os

images_dir = 'client/public/images'
out_dir = 'client/public/images/products'
os.makedirs(out_dir, exist_ok=True)

# 1. Dairy Showcase (1200x896)
dairy = Image.open(f'{images_dir}/dairy_showcase.jpg')
# Amul Paneer
crop_paneer = dairy.crop((350, 250, 850, 750))
crop_paneer.save(f'{out_dir}/amul_paneer.jpg', quality=95)

# Amul Dahi
crop_dahi = dairy.crop((500, 350, 950, 800))
crop_dahi.save(f'{out_dir}/amul_dahi.jpg', quality=95)

# Desi Ghee
crop_ghee = dairy.crop((700, 200, 1150, 650))
crop_ghee.save(f'{out_dir}/desi_ghee.jpg', quality=95)

# Amul Cheese
crop_cheese = dairy.crop((200, 300, 650, 750))
crop_cheese.save(f'{out_dir}/amul_cheese.jpg', quality=95)

# Namaste India Milk / Buttermilk
crop_chaach = dairy.crop((50, 200, 500, 650))
crop_chaach.save(f'{out_dir}/namaste_chaach.jpg', quality=95)


# 2. Ice Cream Showcase (1200x896)
ice = Image.open(f'{images_dir}/icecream_showcase.jpg')
# Waffle Cones / TriCone
crop_cone = ice.crop((50, 150, 550, 650))
crop_cone.save(f'{out_dir}/ice_cone.jpg', quality=95)

# Choco feast / bar
crop_chocobar = ice.crop((350, 200, 800, 650))
crop_chocobar.save(f'{out_dir}/ice_chocobar.jpg', quality=95)

# Kulfi stick
crop_kulfi = ice.crop((550, 250, 980, 680))
crop_kulfi.save(f'{out_dir}/ice_kulfi.jpg', quality=95)

# Ice cream tub / Belgian Chocolate
crop_tub = ice.crop((750, 200, 1180, 650))
crop_tub.save(f'{out_dir}/ice_tub.jpg', quality=95)

# Vanilla cup / Cassata slice
crop_cassata = ice.crop((250, 350, 700, 800))
crop_cassata.save(f'{out_dir}/ice_cassata.jpg', quality=95)


# 3. Vegetables Showcase (1200x896)
veg = Image.open(f'{images_dir}/vegetables_showcase.jpg')
# Farm Potatoes in wicker basket
crop_potatoes = veg.crop((200, 250, 680, 730))
crop_potatoes.save(f'{out_dir}/fresh_potatoes.jpg', quality=95)

# Red Onions
crop_onions = veg.crop((450, 300, 900, 750))
crop_onions.save(f'{out_dir}/fresh_onions.jpg', quality=95)

# Cauliflower head
crop_gobhi = veg.crop((700, 250, 1150, 700))
crop_gobhi.save(f'{out_dir}/fresh_cauliflower.jpg', quality=95)

# Spinach & Green leaves
crop_palak = veg.crop((550, 150, 1000, 600))
crop_palak.save(f'{out_dir}/fresh_spinach.jpg', quality=95)

# Carrots & chillies
crop_carrots = veg.crop((750, 350, 1180, 800))
crop_carrots.save(f'{out_dir}/fresh_carrots.jpg', quality=95)

crop_chillies = veg.crop((300, 450, 750, 880))
crop_chillies.save(f'{out_dir}/fresh_chillies.jpg', quality=95)


# 4. Grocery & Pantry Showcase (1200x896)
groc = Image.open(f'{images_dir}/grocery_showcase.jpg')
# Basmati Rice
crop_rice = groc.crop((250, 180, 700, 630))
crop_rice.save(f'{out_dir}/basmati_rice.jpg', quality=95)

# Toor Dal / Moong Dal in glass jars
crop_toor_dal = groc.crop((450, 200, 900, 650))
crop_toor_dal.save(f'{out_dir}/toor_dal.jpg', quality=95)

crop_moong_dal = groc.crop((550, 250, 980, 680))
crop_moong_dal.save(f'{out_dir}/moong_dal.jpg', quality=95)

# Cooking Oil
crop_oil = groc.crop((700, 180, 1150, 630))
crop_oil.save(f'{out_dir}/cooking_oil.jpg', quality=95)

# Kadak Chai tea
crop_tea = groc.crop((750, 320, 1180, 750))
crop_tea.save(f'{out_dir}/kadak_chai.jpg', quality=95)

# Spices (Turmeric, Chilli powder)
crop_spices = groc.crop((500, 400, 950, 850))
crop_spices.save(f'{out_dir}/indian_spices.jpg', quality=95)

# Salt & Sugar
crop_sugar = groc.crop((100, 350, 550, 800))
crop_sugar.save(f'{out_dir}/sugar_salt.jpg', quality=95)


# 5. Stationery Showcase (1200x896)
stat = Image.open(f'{images_dir}/stationery_showcase.jpg')
# Classmate notebooks
crop_notebooks = stat.crop((50, 180, 500, 630))
crop_notebooks.save(f'{out_dir}/classmate_notebooks.jpg', quality=95)

# Pens in acrylic stand
crop_pens = stat.crop((350, 180, 800, 630))
crop_pens.save(f'{out_dir}/ballpoint_pens.jpg', quality=95)

# Camlin geometry box
crop_geom = stat.crop((500, 250, 950, 700))
crop_geom.save(f'{out_dir}/geometry_box.jpg', quality=95)

# Pencils & Highlighters
crop_pencils = stat.crop((650, 300, 1100, 750))
crop_pencils.save(f'{out_dir}/pencils_highlighters.jpg', quality=95)

# Sticky notes & memo pad
crop_sticky = stat.crop((200, 400, 650, 850))
crop_sticky.save(f'{out_dir}/sticky_notes.jpg', quality=95)

# Colours / Art Pastels
crop_colours = stat.crop((750, 200, 1180, 650))
crop_colours.save(f'{out_dir}/art_colours.jpg', quality=95)


# 6. Cleaning Showcase (1200x896)
clean = Image.open(f'{images_dir}/cleaning_showcase.jpg')
# Vim Dishwash
crop_vim = clean.crop((300, 180, 750, 630))
crop_vim.save(f'{out_dir}/vim_dishwash.jpg', quality=95)

# Dettol soap
crop_dettol = clean.crop((550, 250, 980, 680))
crop_dettol.save(f'{out_dir}/dettol_soap.jpg', quality=95)

# Clinic Plus shampoo
crop_shampoo = clean.crop((700, 180, 1150, 630))
crop_shampoo.save(f'{out_dir}/shampoo_bottle.jpg', quality=95)

# Harpic / Disinfectant Cleaner
crop_cleaner = clean.crop((750, 250, 1180, 700))
crop_cleaner.save(f'{out_dir}/toilet_cleaner.jpg', quality=95)

# Toothpaste & personal care
crop_toothpaste = clean.crop((450, 350, 900, 800))
crop_toothpaste.save(f'{out_dir}/herbal_toothpaste.jpg', quality=95)

print("AI Product packshots successfully generated and cropped from 8k showcases!")
