# %% imports
import numpy as np
import matplotlib.pyplot as plt

# %% logo
# in light theme the yellow markers are barely visible and it looks like a funnel (filter glyph)
# in dark the violet center is barely visible and the shape seems circular. Looks nice.
rng = np.random.default_rng(1)

# circular markers
angles = np.arange(0, 360, 60) - 30 - 180
x = np.cos(angles * np.pi / 180)
y = np.sin(angles * np.pi / 180)

# center marker
x = np.append(x, 0)
y = np.append(y, 0)

# colors (center violet)
c = rng.random(x.shape)
c[-1] = -0.5

# plot and export
fig, ax = plt.subplots(figsize=(2, 2))
plt.scatter(x, y, s=1400, c=c, marker='H')
# plt.axis('')
plt.axis('off')
plt.xlim(-1.4, 1.4)
plt.ylim(-1.4, 1.4)
# fig.savefig('icon.svg', transparent=True, bbox_inches='tight')  # SVG not allowed in Marketplace
fig.savefig('icon.png', transparent=True, bbox_inches='tight')

# POST-PROCESSING:
# convert icon.png -trim icon.png
