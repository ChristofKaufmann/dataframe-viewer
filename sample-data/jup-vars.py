# %%
import pandas as pd
df = pd.read_csv('cities.csv', parse_dates=['last_census'])
# Ordered categorical so the heatmap colors size_class by rank (read_csv alone
# yields a plain string column, which the heatmap leaves uncolored).
df['size_class'] = pd.Categorical(
    df['size_class'], categories=['Very Small', 'Small', 'Medium', 'Large', 'Megacity'], ordered=True
)

# %%
df = df.dropna().set_index('last_census')

# %%
#df = df.set_index('city')

# %%
df = df.set_index(['city', 'country'])
