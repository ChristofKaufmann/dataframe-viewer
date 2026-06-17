# %%
import numpy as np
import matplotlib.pyplot as plt

mask = np.array([
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    [0,0,1,0,1,0,1,0,1,0,1,0,1,0,0],
    [0,0,0,1,0,1,0,1,0,1,0,1,0,0,0],
    [0,0,0,0,1,0,1,0,1,0,1,0,0,0,0],
    [0,0,0,0,0,1,0,1,0,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,1,0,0,0,0,0,0],
    # [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    # [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    # [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    # [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    # [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,1,0,0,0,0,0,0],
], dtype=float)
mask[mask == 0] = np.nan

rng = np.random.default_rng(42)
r = rng.random(mask.shape) * 5 + np.arange(1, 1 + mask.shape[0]).reshape(-1, 1)

X, Y = np.meshgrid(np.arange(mask.shape[1]), np.arange(mask.shape[0]))
X = X * 0.65
# Y = Y * 0.60
plt.scatter(X.ravel(), -Y.ravel(), c=(r * mask).ravel(), s=500, marker='h')
plt.axis('equal')
# plt.xlim(-1, 7)
# plt.ylim(-5, 1)

# %%

mask = np.array([
    [0,0,0,0,0,0,1,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,0,1,0,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,1,0,0,0,0,0,0],
], dtype=float)
mask[mask == 0] = np.nan

rng = np.random.default_rng(42)
r = rng.random(mask.shape) * 5 + np.arange(1, 1 + mask.shape[0]).reshape(-1, 1)

X, Y = np.meshgrid(np.arange(mask.shape[1]), np.arange(mask.shape[0]))
X = X * 0.58
# Y = Y * 0.60
fig, ax = plt.subplots(figsize=(2, 2))
plt.scatter(X.ravel(), -Y.ravel(), c=(r * mask).ravel(), s=1000, marker='H')
plt.axis('equal')
# plt.axis('off')
# plt.
plt.xlim(2, 6)
# plt.xlim(3, 11)
# plt.ylim(-7, 1)

# %%
