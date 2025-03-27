import re

def add_rrsp_tfsa_fields(file_path, is_spouse=False):
    with open(file_path, 'r') as file:
        content = file.read()
    
    # Identify the section where we need to add the fields
    if is_spouse:
        # For spouse section in SpouseInfoStep.tsx
        savings_section_pattern = r'(Grid item xs={12}>\s*<Divider sx={{ my: 2 }} />\s*<Typography variant="h6">Spouse\'s Current Savings</Typography>\s*</Grid>)'
    else:
        # For primary person section in PersonalInfoStep.tsx or PrimaryPersonStep.tsx
        savings_section_pattern = r'(Grid item xs={12}>\s*<Divider sx={{ my: 2 }} />\s*<Typography variant="h6">.*Current Savings</Typography>\s*</Grid>)'
    
    # The fields to add after the existing account balance fields
    new_fields = """
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="{prefix}RRSP Contribution Room"
          type="number"
          value={userInput{suffix}rrspRoom || 0}
          onChange={(e) => {suffix_fn}'rrspRoom', parseFloat(e.target.value))}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="{prefix}TFSA Contribution Room"
          type="number"
          value={userInput{suffix}tfsaRoom || 0}
          onChange={(e) => {suffix_fn}'tfsaRoom', parseFloat(e.target.value))}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
      </Grid>
    """
    
    # Format the fields differently based on if it's for spouse or primary
    if is_spouse:
        prefix = "Spouse's "
        suffix = ".spouseInfo."
        suffix_fn = "onInputChange('spouseInfo', {...userInput.spouseInfo!, "
    else:
        prefix = ""
        suffix = "."
        suffix_fn = "onInputChange("
    
    new_fields = new_fields.replace("{prefix}", prefix)
    new_fields = new_fields.replace("{suffix}", suffix)
    new_fields = new_fields.replace("{suffix_fn}", suffix_fn)
    
    # Find the end of the savings account sections to add our new fields
    investment_pattern = r'(Grid item xs={12} md={4}>\s*<TextField\s*fullWidth\s*label=".*Other Investments".*?\s*</Grid>)'
    
    # Add the new fields after the Other Investments field
    if re.search(investment_pattern, content):
        updated_content = re.sub(investment_pattern, r'\1' + new_fields, content)
        
        # Save the updated file
        with open(file_path, 'w') as file:
            file.write(updated_content)
        return True
    else:
        print(f"Could not find the investment pattern in {file_path}")
        return False

# Update the type definition to include the new fields
def update_types_file(file_path):
    with open(file_path, 'r') as file:
        content = file.read()
    
    # Find the UserInput interface
    user_input_pattern = r'export interface UserInput {(.*?)}'
    user_input_match = re.search(user_input_pattern, content, re.DOTALL)
    
    if user_input_match:
        user_input_content = user_input_match.group(1)
        
        # Check if fields already exist
        if 'rrspRoom' not in user_input_content and 'tfsaRoom' not in user_input_content:
            # Add new fields to UserInput
            new_fields = """
  // Contribution Room
  rrspRoom: number;
  tfsaRoom: number;"""
            
            updated_user_input = user_input_content + new_fields
            updated_content = content.replace(user_input_content, updated_user_input)
            
            # Find the SpouseInfo interface
            spouse_pattern = r'export interface SpouseInfo {(.*?)}'
            spouse_match = re.search(spouse_pattern, updated_content, re.DOTALL)
            
            if spouse_match:
                spouse_content = spouse_match.group(1)
                
                # Check if fields already exist in SpouseInfo
                if 'rrspRoom' not in spouse_content and 'tfsaRoom' not in spouse_content:
                    # Add new fields to SpouseInfo
                    new_spouse_fields = """
  // Contribution Room
  rrspRoom: number;
  tfsaRoom: number;"""
                    
                    updated_spouse = spouse_content + new_spouse_fields
                    updated_content = updated_content.replace(spouse_content, updated_spouse)
                    
                    # Save the updated file
                    with open(file_path, 'w') as file:
                        file.write(updated_content)
                    return True
        else:
            print("Fields already exist in types file")
    else:
        print("Could not find UserInput interface in types file")
    return False

# Update the initial values
def update_initial_values(file_path):
    with open(file_path, 'r') as file:
        content = file.read()
    
    # Find the initial user input values
    init_pattern = r'const initialUserInput: UserInput = {(.*?)};'
    init_match = re.search(init_pattern, content, re.DOTALL)
    
    if init_match:
        init_content = init_match.group(1)
        
        # Check if fields already exist
        if 'rrspRoom' not in init_content and 'tfsaRoom' not in init_content:
            # Add the fields to initialUserInput
            new_fields = """
  // Contribution Room
  rrspRoom: 0,
  tfsaRoom: 0,"""
            
            # Find a good position to insert new fields
            insert_position = init_content.rfind(',')
            if insert_position != -1:
                updated_init = init_content[:insert_position+1] + new_fields + init_content[insert_position+1:]
                updated_content = content.replace(init_content, updated_init)
                
                # Save the updated file
                with open(file_path, 'w') as file:
                    file.write(updated_content)
                return True
    else:
        print("Could not find initialUserInput in file")
    return False

# Update the default spouse info
def update_default_spouse_info(file_path):
    with open(file_path, 'r') as file:
        content = file.read()
    
    # Find the default spouse info initialization
    spouse_pattern = r'const defaultSpouseInfo: SpouseInfo = {(.*?)};'
    spouse_match = re.search(spouse_pattern, content, re.DOTALL)
    
    if spouse_match:
        spouse_content = spouse_match.group(1)
        
        # Check if fields already exist
        if 'rrspRoom' not in spouse_content and 'tfsaRoom' not in spouse_content:
            # Add the fields to defaultSpouseInfo
            new_fields = """
        rrspRoom: 0,
        tfsaRoom: 0,"""
            
            # Find a good position to insert new fields
            insert_position = spouse_content.rfind(',')
            if insert_position != -1:
                updated_spouse = spouse_content[:insert_position+1] + new_fields + spouse_content[insert_position+1:]
                updated_content = content.replace(spouse_content, updated_spouse)
                
                # Save the updated file
                with open(file_path, 'w') as file:
                    file.write(updated_content)
                return True
    else:
        print("Could not find defaultSpouseInfo in file")
    return False

# Main execution
files_to_update = [
    'src/components/forms/InputForm/PersonalInfoStep.tsx',
    'src/components/forms/InputForm/PrimaryPersonStep.tsx',
    'src/components/forms/InputForm/SpouseInfoStep.tsx',
    'src/models/types.ts',
    'src/pages/InputForm.tsx'
]

print("Updating files to add RRSP and TFSA contribution room fields...")

for file_path in files_to_update:
    print(f"Processing {file_path}...")
    
    if 'SpouseInfoStep' in file_path:
        result = add_rrsp_tfsa_fields(file_path, is_spouse=True)
        if result:
            print(f"Successfully updated {file_path}")
        else:
            print(f"Failed to update {file_path}")
    
    elif 'PersonalInfoStep' in file_path or 'PrimaryPersonStep' in file_path:
        result = add_rrsp_tfsa_fields(file_path)
        if result:
            print(f"Successfully updated {file_path}")
        else:
            print(f"Failed to update {file_path}")
    
    elif 'types.ts' in file_path:
        result = update_types_file(file_path)
        if result:
            print(f"Successfully updated types in {file_path}")
        else:
            print(f"Failed to update types in {file_path}")
    
    elif 'InputForm.tsx' in file_path:
        result = update_initial_values(file_path)
        if result:
            print(f"Successfully updated initial values in {file_path}")
        else:
            print(f"Failed to update initial values in {file_path}")
        
        # Also update spouse default values
        if 'PersonalInfoStep' in file_path or 'SpouseInfoStep' in file_path:
            result = update_default_spouse_info(file_path)
            if result:
                print(f"Successfully updated default spouse info in {file_path}")
            else:
                print(f"Failed to update default spouse info in {file_path}")

print("All files processed.")