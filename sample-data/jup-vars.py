# %%
import pandas as pd
df = pd.read_csv('cities.csv', parse_dates=['last_census'])

# %%
df = df.dropna().set_index('last_census')

# %%
#df = df.set_index('city')

# %%
df = df.set_index(['city', 'country'])
